#![no_std]

use client_io::*;
use oracle_io::*;
use ft_io::*;
use gstd::{exec, msg, prelude::*, ActorId};

#[derive(Debug, Default)]
pub struct Client {
    pub oracle: ActorId,
    pub link_token: ActorId,
    pub request_id: u128,
    pub request_job_id: BTreeMap<String, String>,
    pub requests: BTreeMap<u128, ClientRequest>,
    pub payment: u128,
}
static mut CLIENT: Option<Client> = None;

impl Client {
    /// Creates request for oracle
    /// Requirements:
    /// * Caller must have enough tokens for request payment
    /// Arguments:
    /// * `data`: the information the user wants to know (for example: "weather", "wind", "rain")
    async fn make_request(&mut self, data: String) {
        // looking for a specific job for the specified request
        let job_id = self.request_job_id.get(&data).expect("Unknown request name");
       
        self.requests.insert(self.request_id, ClientRequest {
            job_id: job_id.clone(),
            data_requested: data.clone(),
            data_answer: String::new(),
            fulfilled: false,
        });
        // approve oracle contract to spend tokens
        let _approve_response: Event = msg::send_and_wait_for_reply(
            self.link_token,
            Action::Approve{
                to: self.oracle,
                amount: self.payment,
            },
            0,
        )
        .await
        .expect("Error in approve tokens");
        // request to oracle
        let _oracle_response: OracleEvent = msg::send_and_wait_for_reply(
            self.oracle,
            OracleAction::Request{
                payment: self.payment,
                job_id: job_id.clone(),
                callback_address: exec::program_id(),
                request_id: self.request_id,
                data: data.clone(),
            },
            0,
        )
        .await
        .expect("Error in making request to oracle");

        self.request_id += 1;
        msg::reply(
            ClientEvent::RequestMade {
                job_id: job_id.to_string(),
                data,
            },
            0
        );
    }

    /// Called by the oracle to return data answer
    /// Requerements:
    /// * The caller must be the authorized oracle
    /// Arguments:
    /// * `request_id`: the fulfillment request ID
    /// * `data`: the data answer
    fn oracle_answer(&mut self, request_id: u128, data: String) {
        self.check_oracle_id();
        self.requests.entry(request_id)
                    .and_modify(|r| {
                        r.data_answer = data.clone();
                        r.fulfilled = true;
                     });
        msg::reply(
            ClientEvent::RequestFulfilled {
                request_id,
                data_answer: data,
            },
            0
        );
    }

    fn check_oracle_id(&self) {
        if self.oracle != msg::source() {
            panic!("Not an authorized oracle");
        }
    }
    
}

#[no_mangle]
pub unsafe extern "C" fn init() {
    let config: InitClient = msg::load().expect("Unable to decode InitConfig");
    let client = Client {
        oracle: config.oracle,
        link_token: config.link_token,
        request_job_id: config.request_job_id,
        ..Client::default()
    };
   CLIENT = Some(client);
}

#[gstd::async_main]
async fn main() {
    let action: ClientAction = msg::load().expect("Could not load Action");
    let client: &mut Client = unsafe {CLIENT.get_or_insert(Client::default())};
    match action {
        ClientAction::MakeRequest(data) => {
            client.make_request(data).await;
        },
        ClientAction::OracleAnswer {request_id, data} => client.oracle_answer(request_id, data),
        ClientAction::Request(request_id) => {
            let request = client.requests.get(&request_id).expect("Unknown request id");
            msg::reply(
                ClientEvent::Request(request.clone()),
                0
            );
        }
    }
}