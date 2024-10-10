deploy-bridge-sepolia:
    @set -a; source .env; set +a; \
    forge script script/Bridge.s.sol --rpc-url $$SEPOLIA_ENDPOINT --private-key $$PRIVATE_KEY --chain 11155111
deploy-bridge-base-sepolia:
    @set -a; source .env; set +a; \
    forge script script/Bridge.s.sol --rpc-url $$BASE_SEPOLIA_ENDPOINT --private-key $$PRIVATE_KEY --chain 84532
deploy-dannyToken:
    @set -a; source .env; set +a; \
    forge script script/DannyToken.s.sol --rpc-url $$SEPOLIA_ENDPOINT --private-key $$PRIVATE_KEY --chain 11155111
deploy-wrappedToken:
    @set -a; source .env; set +a; \
    forge script script/WrappedToken.s.sol --rpc-url $$BASE_SEPOLIA_ENDPOINT --private-key $$PRIVATE_KEY --chain 84532
deploy-test-bridge:
	@set -a; source .env; set +a; \
    forge script script/Bridge.s.sol --rpc-url $$TEST_ENDPOINT --private-key $$TEST_PRIVATE_KEY --broadcast