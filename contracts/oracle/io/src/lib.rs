#![no_std]
use gstd::{ActorId, String};
use scale_info::TypeInfo;
use codec::{Decode, Encode};
pub type AccountAndRequestId = String;

#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct InitOracle {
    pub owner: ActorId,
    pub link_token: ActorId,
    pub external_adapter: ActorId
}

#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct OracleRequest {
    pub caller: ActorId,
    pub id: u128,
    pub job_id: String,
    pub callback_address: ActorId,
    pub data: String,
    pub payment: u128,
    pub expiration: u64,
}

#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum OracleAction {
    Request{
        payment: u128,
        job_id: String,
        callback_address: ActorId,
        request_id: u128,
        data: String,
    },
    FullfillRequest {
        request_key: AccountAndRequestId,
        data: String,
    },
    CancelRequest{
        account: ActorId,
        request_id: u128,
    }
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum OracleEvent {
    Request{
        job_id: String,
        caller: ActorId,
        data: String,
    },
    RequestFulfilled {
        account: ActorId,
        request_id: u128,
    },
    RequestCancelled {
        account: ActorId,
        request_id: u128,
    }
}
