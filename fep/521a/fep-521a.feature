Feature: FEP-521a: Representing actor's public keys

    @fep-521a
    Scenario: Representing Ed25519 public key
        Given the Ed25519 public key as a hex string "2e6fcce36701dc791488e0d0b1745cc1e33a4c1c9fcc41c63bd343dbbe0970e6"
        And actor ID "https://server.example/users/alice"
        Then Multikey object is
            """
            {
                "id": "https://server.example/users/alice#ed25519-key",
                "type": "Multikey",
                "controller": "https://server.example/users/alice",
                "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
            }
            """

    @fep-521a
    Scenario: Representing RSA public key
        Given the RSA public key in PKCS#1 DER format as a hex string "3082010a0282010100b1b5fcd8d4d5e88ca5c4287b31f578865caf6a78826a3b8ff7b1b23aa4af4e6a0474139f945bd9d3a911ffd0fa72db78e4593a86c91f9da836186ebd3402d51f6a3844247ab5088b46929c311b43604fed84499f06f0f39bf55590e2187f1bbe229ba8f49fd2e570cd0e3733c76bfede80e1e7e0881e4538ea1bc5782be9512f8bf132526e05f4923564fe6e1e21bf7087adebb660fa533fca06d0a8e66991e1312d70b64a61da8ca77c028cdf939601e2cffe2855759b1d479f0847bcac59d7d62427a431d4e3dfd2697428b9dd6309a7b1167db99fe01af1ff1b739566fb949e47089d1dae84aef1214ef7f5773e86a0d3e9da246f9bec09d60c705891183d0203010001"
        And actor ID "https://server.example/users/alice"
        Then Multikey object is
            """
            {
                "id": "https://server.example/users/alice#rsa-key",
                "type": "Multikey",
                "controller": "https://server.example/users/alice",
                "publicKeyMultibase": "z4MXj1wBzi9jUstyPMS4jQqB6KdJaiatPkAtVtGc6bQEQEEsKTic4G7Rou3iBf9vPmT5dbkm9qsZsuVNjq8HCuW1w24nhBFGkRE4cd2Uf2tfrB3N7h4mnyPp1BF3ZttHTYv3DLUPi1zMdkULiow3M1GfXkoC6DoxDUm1jmN6GBj22SjVsr6dxezRVQc7aj9TxE7JLbMH1wh5X3kA58H3DFW8rnYMakFGbca5CB2Jf6CnGQZmL7o5uJAdTwXfy2iiiyPxXEGerMhHwhjTA1mKYobyk2CpeEcmvynADfNZ5MBvcCS7m3XkFCMNUYBS9NQ3fze6vMSUPsNa6GVYmKx2x6JrdEjCk3qRMMmyjnjCMfR4pXbRMZa3i"
            }
            """
