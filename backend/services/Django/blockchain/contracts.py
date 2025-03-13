from web3 import Web3
import json

# Connect to the local Ganache instance
web3 = Web3(Web3.HTTPProvider('http://blockchain:8545'))

# Check if connected
if web3.is_connected():
	print("Connected to Ethereum node")
else:
	print("Failed to connect to Ethereum node")

def read_contract_address():
	try:
		with open('/web3_share/address.txt', 'r') as file:
			contract_address = file.read().strip()
			return contract_address
	except FileNotFoundError:
		print("Contract address file not found. Make sure the file 'contract_address.txt' exists.")
		return None

def read_contract_abi():
    try:
        with open('/web3_share/MatchScore.json', 'r') as abi_file:
            contract_abi = json.load(abi_file)
            return contract_abi['abi']
    except FileNotFoundError:
        print(f"Contract ABI file not found. Make sure the file '{file_path}' exists.")
        return None

def read_keys():
	try:
		with open('/web3_share/keys.json', 'r') as f:
			keys = json.load(f)
			return keys
	except FileNotFoundError:
		print(f"Keys file not found. Make sure the file 'keys.json' exists.")
		return None

contract_address = read_contract_address()
contract_abi = read_contract_abi()
keys = read_keys()

# Deploy once
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Get account via private Key
account_address = list(keys['addresses'].keys())[0]
private_key = keys['private_keys'][account_address]
account = web3.eth.account.from_key(private_key)

if __name__ == '__main__':
	try:
		p1id, p2id, p1score, p2score = contract.functions.getMatchScore(1).call()
		if (p1id == 0 and p2id == 0 and p1score == 0 and p2score == 0):
			print("Failed!")
		print(f"p1id: {p1id}, p2id: {p2id}, p1score: {p1score}, p2score: {p2score}")
	except Exception as e:
		print("Error: ", e)