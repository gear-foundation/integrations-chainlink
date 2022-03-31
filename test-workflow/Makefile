PATH_TO_WASM=~/path/to/oracle
ORACLE_ID=0x7c9a631f1fdb418530fdc9453fb40c3b04b6412d222daeaf18ed22b6eb847f59
PATH_TO_PAYLOAD=./payload.json
WS_PROVIDER=ws://localhost:9944

upload:
	node upload-oracle.js $(WS_PROVIDER) $(PATH_TO_WASM)

send:
	node send-message-to-oracle.js $(WS_PROVIDER) $(PATH_TO_WASM) $(ORACLE_ID) $(PATH_TO_PAYLOAD)