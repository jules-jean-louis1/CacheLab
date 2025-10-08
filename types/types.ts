export enum StrategyHash {
    SHA256 = 'sha256',
    MD5 = 'md5',
    SHA512 = 'sha512'
}

export interface HashStrategy {
    strategie: string
}