# eth-makers

### Install tronbox

```
npm i -g tronbox
tronbox --download-compiler 0.5.10
```

### Run local tron node

```
docker pull trontools/quickstart
docker run -it -p 9090:9090 --rm --name tron <options> trontools/quickstart
```

#### Documentation for tronbox

```
https://developers.tron.network/
```

#### Example with mnemonic and 100 accounts

```
docker run -it -p 9090:9090 --rm --name tron -e "mnemonic=tube large talent pilot trade example program rare vast edit expect track" -e "accounts=100" -e "defaultBalance=100000" trontools/quickstart
```

### Build the contract - Compile when you make a change

```
tronbox compile
```

### Migrate the contract - Deploy on local

```
tronbox migrate --network <shasta>
```
# GKA
