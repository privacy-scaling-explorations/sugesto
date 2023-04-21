import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable, zeroPad } from "@ethersproject/bytes"
import { keccak256 } from "@ethersproject/keccak256"
import { poseidon2 } from "poseidon-lite"

export default function calculateNullifierHash(
    identityNullifier: string | number | bigint,
    externalNullifier: BytesLike | Hexable | number | bigint | string
): bigint {
    externalNullifier = BigNumber.from(externalNullifier).toTwos(256).toHexString()
    externalNullifier = zeroPad(externalNullifier, 32)
    externalNullifier = BigInt(keccak256(externalNullifier)) >> BigInt(8)

    return poseidon2([externalNullifier, identityNullifier])
}
