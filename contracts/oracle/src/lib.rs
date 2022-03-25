#![no_std]

use oracle_io::*;
use client_io::*;
use gstd::{exec, debug,msg, prelude::*, ActorId};
use primitive_types::H256;
pub mod ft_messages;
use ft_messages::transfer_tokens;
use scale_info::TypeInfo;
use codec::{Encode};

#[derive(Debug, Default, TypeInfo, Encode)]
pub struct Oracle {
    pub owner: ActorId,
    pub link_token: ActorId,
    pub external_adapter: ActorId,
    pub requests: BTreeMap<AccountAndRequestId, OracleRequest>,
}

static mut ORACLE: Option<Oracle> = None;
const EXPIRY_TIME: u64 = 5 * 60 * 1_000_000_000;

impl Oracle {
    /// Receives a request from a client contract and puts it to the oracle state
    /// Arguments:
    /// * `payment`: the amount of payment for the oracle job
    /// * `job_id`: the specification of the job on the chainlink node
    /// * `callback_address`: the callback address for the response
    /// * `request_id`: the ID of the request sent by the requester
    /// * `data`: the CBOR payload of the request
    async fn request(&mut self, payment: u128, job_id: String, callback_address: ActorId, request_id: u128, data: String) {
        let account_and_request_id =
            format!("{}{}", H256::from_slice(msg::source().as_ref()),request_id);
        if self.requests.contains_key(&account_and_request_id) {
            panic!("Existing account and reqiest id in requests");
        }
   //     transfer_tokens(&self.link_token, &msg::source(), &exec::program_id(), payment).await;
        self.requests.insert(account_and_request_id, OracleRequest {
            caller: msg::source(),
            id: request_id,
            job_id: job_id.clone(),
            callback_address,
            data: data.clone(),
            payment,
            expiration: exec::block_timestamp() + EXPIRY_TIME,
        });
        msg::reply(
            OracleEvent::Request {
                job_id,
                caller: msg::source(),
                data
            },
            0
        );
    }

    /// Called by the external adapter to fulfill requests
    /// Requerements:
    /// * The caller must be the authorized external adapter
    /// Arguments:
    /// * `account`: the client address
    /// * `request_id`: the fulfillment request ID that must match the account
    /// * `data`: the data to return to the consuming client contract
    async fn fullfill_requests(&mut self, requests: BTreeMap<AccountAndRequestId, Result<String, String>>) {
        self.check_external_adapter();

        for (key, req) in requests.iter() {
            let request =  self.requests.remove(key).expect("That request doesn't exist");
            let _client_response: ClientEvent = msg::send_and_wait_for_reply(
            request.callback_address,
            ClientAction::OracleAnswer{
                request_id: request.id,
                data: req.clone(),
                },
                0,
            )
            .await
            .expect("Error in sending answer to client");
           
        }
        msg::reply(OracleEvent::RequestsFulfilled(requests), 0);
    }
    /// Allows requesters to cancel requests sent to this oracle contract
    /// Will transfer the LINK tokens back to the client address.
    /// Requerements:
    /// * The request must have expired
    /// Arguments:
    /// * `account`: the client address
    /// * `request_id`: The request ID
    async fn cancel_request(&mut self, account: &ActorId, request_id: u128) {
        let account_and_request_id =
            format!("{}{}", H256::from_slice(account.as_ref()), request_id);
        let request =  self.requests.remove(&account_and_request_id).expect("That request doesn't exist");
        if request.expiration > exec::block_timestamp() {
            panic!("Request is not expired");
        }
        transfer_tokens(&self.link_token, &exec::program_id(), account, request.payment).await;
        msg::reply(
            OracleEvent::RequestCancelled {
                account: request.caller,
                request_id,
            },
            0
        );
    }

    fn check_external_adapter(&self) {
        if self.external_adapter != msg::source() {
            panic!("Not an authorized node to fulfill requests");
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn init() {
    let config: InitOracle = msg::load().expect("Unable to decode InitConfig");
    let oracle = Oracle {
        owner: config.owner,
        link_token: config.link_token,
        external_adapter: config.external_adapter,
        ..Oracle::default()
    };
   ORACLE = Some(oracle);
}

#[gstd::async_main]
async fn main() {
    let action: OracleAction = msg::load().expect("Could not load Action");
    let oracle: &mut Oracle = unsafe {ORACLE.get_or_insert(Oracle::default())};
    match action {
        OracleAction::Request{payment, job_id, callback_address, request_id, data} => {
            oracle.request(payment, job_id, callback_address, request_id, data).await;
        },
        OracleAction::FullfillRequests(requests)  => oracle.fullfill_requests(requests).await,
        OracleAction::CancelRequest {account, request_id} => oracle.cancel_request(&account, request_id).await
    }
}

#[no_mangle]
pub unsafe extern "C" fn meta_state() -> *mut [i32; 2] {
    let oracle: &mut Oracle = ORACLE.get_or_insert(Oracle::default());
    let encoded = oracle.requests.encode();
    gstd::util::to_leak_ptr(encoded)
}


gstd::metadata! {
    title: "Oracle",
    init:
        input: InitOracle,
    handle: 
        input: OracleAction,
    state:
        output: BTreeMap<AccountAndRequestId, OracleRequest>,
}