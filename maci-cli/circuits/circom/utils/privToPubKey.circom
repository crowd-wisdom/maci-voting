pragma circom 2.0.0;

// circomlib imports
include "./bitify.circom";
include "./escalarmulfix.circom";

/**
 * Converts a private key to a public key on the BabyJubJub curve.
 * The input private key needs to be hashed and then pruned before.
 */
template PrivToPubKey() {
    // The base point of the BabyJubJub curve.
    var BASE8[2] = [
        5299619240641551281634865583518297030282874472190772894086521144482721001553,
        16950150798460657717958625567821834550301663161624707787222815936182638968203
    ];

    signal input privKey;
    signal output pubKey[2];

    // Convert the private key to bits.
    var computedPrivBits[253] = Num2Bits(253)(privKey);

    // Perform scalar multiplication with the basepoint.
    var computedEscalarMulFix[2] = EscalarMulFix(253, BASE8)(computedPrivBits);

    pubKey <== computedEscalarMulFix;
}
