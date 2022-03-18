use codec::Encode;
use gtest::{Program, System};
use gstd::prelude::*;
use oracle_io::*;
use ft_io::*;
use client_io::*;
const CLIENT_CONTRACT: u64 = 2;
const EXTERNAL_ADAPTER: u64 = 4;
const USER: u64 = 5;

fn init_fungible_token(sys: &System) {
    sys.init_logger();
    let ft = Program::from_file(
        &sys,
        "../fungible-token/target/wasm32-unknown-unknown/release/fungible_token.wasm",
    );

    let res = ft.send(
        USER,
        InitConfig {
            name: String::from("MyToken"),
            symbol: String::from("MTK"),
        },
    );

    assert!(res.log().is_empty());

    let res = ft.send(USER, Action::Mint(10000000));
    assert!(!res.main_failed());
    let res = ft.send(
        USER,
        Action::Transfer {
            from: USER.into(),
            to: 2.into(),
            amount: 100,
        }
    );
    assert!(!res.main_failed());
}

fn init_client(sys: &System) {
    let client = Program::from_file(
        &sys,
        "../client/target/wasm32-unknown-unknown/release/client.wasm",
    );
    let mut request_job_id = BTreeMap::new();
    request_job_id.insert("Rain".to_string(), "3c7838a5810c4aeea140134d10a6d0c3".to_string());
    request_job_id.insert("Hail".to_string(), "3c7838a5810c4aeea140134d10a6d0c3".to_string());
    request_job_id.insert("Temperature".to_string(), "93b72982721945268cf3ba75894f773e".to_string());
    let res = client.send(
        USER,
        InitClient {
            oracle: 3.into(),
            link_token: 1.into(),
            request_job_id,
        },
    );
    assert!(res.log().is_empty());
}


fn init_oracle(sys: &System) {
    let oracle = Program::current(&sys);
    let res = oracle.send(
        USER,
        InitOracle {
            owner: USER.into(),
            link_token: 1.into(),
            external_adapter: EXTERNAL_ADAPTER.into(),
        },
    );
    assert!(res.log().is_empty());
}

#[test]
fn make_request() {
    let sys = System::new();
    init_fungible_token(&sys);
    init_client(&sys);
    init_oracle(&sys);
    let oracle = sys.get_program(3);
    let res = oracle.send(
        USER,
        OracleAction::Request{
            payment: 10,
            job_id: "Job ID".to_string(),
            callback_address: USER.into(),
            request_id: 0,
            data: "Rain".to_string(),
        }
    );
    assert!(res.contains(&(
        USER,
        OracleEvent::Request {
            job_id: "Job ID".to_string(),
            caller: USER.into(),
            data: "Rain".to_string(),
        }
        .encode()
    )));
}

#[test]
fn make_request_through_client_contract() {
    let sys = System::new();
    init_fungible_token(&sys);
    init_client(&sys);
    init_oracle(&sys);
    let ft = sys.get_program(1);
    let client = sys.get_program(2);
    let oracle = sys.get_program(3);
    // user sends tokens to client contract
    let res = ft.send(
        USER,
        Action::Transfer {
            from: USER.into(),
            to: 1.into(),
            amount: 1000,
        }
    );
    assert!(!res.main_failed());
    // user make request through client contract
    // client contract calls oracle
    let res = client.send(
        USER,
        ClientAction::MakeRequest("Rain".to_string())
    );
    assert!(res.contains(&(
        USER,
        ClientEvent::RequestMade {
            job_id: "3c7838a5810c4aeea140134d10a6d0c3".to_string(),
            data: "Rain".to_string(),
        }
        .encode()
    )));

    // External adapter returns answer from the chainlink node
    // Oracle calls client and sends received data
    let res = oracle.send(
        EXTERNAL_ADAPTER,
        OracleAction::FullfillRequest{
            account: CLIENT_CONTRACT.into(),
            request_id: 0,
            data: "AnswerFromChainlink".to_string(),
        }
    );
    assert!(res.contains(&(
        EXTERNAL_ADAPTER,
        OracleEvent::RequestFulfilled  {
            account: CLIENT_CONTRACT.into(),
            request_id: 0,
        }
        .encode()
    )));

    // Checks the request state
    let res = client.send(USER,ClientAction::Request(0));
    assert!(res.contains(&(
        USER,
        ClientEvent::Request(ClientRequest{
            job_id: "3c7838a5810c4aeea140134d10a6d0c3".to_string(),
            data_requested: "Rain".to_string(),
            data_answer: "AnswerFromChainlink".to_string(),
            fulfilled: true,

        })
        .encode()
    )));
}