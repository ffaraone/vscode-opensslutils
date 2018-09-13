# OpenSSL Utils

OpenSSL utils allows you to invoke the most frequent OpenSSL commands directly from Visual Studio Code.


## Configuration

If openssl in not on your path you can change the `opensslutils.opensslPath` setting to provide the full path to the openssl executable.
For Windows users: in order to use OpenSSL through Windows Subsystem for Linux (WSL) you must set `opensslutils.useWsl` to true.

## Features

### Generate Private Key


![Generate Key and Csr](images/privkey.gif)


### Generate RSA Private Key and Certificate Signing Request 


![Generate Key and Csr](images/keycsr.gif)

### Generate self-signed Certificate and Private Key


![Generate Self-signed](images/selfsigned.gif)


### Certificate and CSR preview

![Preview](images/preview.gif)

### Export PKCS#12


![P12](images/p12.gif)


### Convert PEM encoded Certificate to DER
![PEM2DER](images/pem2der.gif)

### Convert DER encoded Certificate to PEM
![DER2PEM](images/der2pem.gif)


## Requirements

You must have OpenSSL 0.9.8 or greater in your PATH.


## Known Issues

At the time of writing this README there are no known issues.

## Release Notes

### 1.1.1

* add support to use openssl through Windows Subsystem for Linux on Windows


### 1.0.1

* Fix a css issue on Windows
* Add a setting to specify the full path to the openssl executable.
* Using the PKCS#12 export command, show an error message if no workspace has been opened.


## Contributors

* Omar de Mingo
* Fabrizio Balsamo

## License

OpenSSL Utils is licensed under the MIT license.
