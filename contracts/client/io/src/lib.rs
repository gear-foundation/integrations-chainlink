#![no_std]
use gstd::{ActorId, prelude::*};
use scale_info::TypeInfo;
use codec::{Decode, Encode};

#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct InitClient {
    pub oracle: ActorId,
    pub link_token: ActorId,
    pub request_job_id: BTreeMap<String, String>,
}


#[derive(Debug, Default, Decode, Encode, Clone,TypeInfo)]
pub struct ClientRequest {
    pub job_id: String,
    pub data_requested: String,
    pub data_answer:String,
    pub fulfilled: bool,
    pub success: bool,
}

#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum ClientAction {
    MakeRequest(String),
    OracleAnswer {
        request_id: u128,
        data: Result<String,String>,
    },
    Request(u128),

}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum ClientEvent {
    RequestMade{
        job_id: String,
        data: String,
    },
    RequestsFulfilled{
        request_id: u128,
        data_answer: String,
    },
    Request(ClientRequest),
}