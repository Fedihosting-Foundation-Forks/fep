Feature: Dereferencing URIs with webfinger as described in fep-4adb
    
    Scenario: Case 1
        Given Webfinger response from "webfinger1.jrd"
        When Looking up "acct:moocow@having.examples.rocks"
        Then Lookup at "https://having.examples.rocks/.well-known/webfinger?resource=acct%3Amoocow%40having.examples.rocks"
        Then ActivityPub Object Id is "https://having.examples.rocks/endpoints/mooo"
