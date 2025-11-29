export enum StrategyHash {
    SHA256 = 'sha256',
    MD5 = 'md5',
    SHA512 = 'sha512'
}

export interface HashStrategy {
    strategie: string
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    statusCode: number;
    timestamp: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    statusCode: number;
    timestamp: string;
    details?: any;
}

// Collection Types
export interface HashMapMetadata {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    elementCount: number;
    bucketCount: number;
    lastAccessed: string;
}

export interface CollectionData {
    hashMaps: HashMapMetadata[];
    totalHashMaps: number;
    totalElements: number;
}

// Request Types
export interface CreateHashMapRequest {
    name: string;
    initialData?: Record<string, any>;
}

export interface AddKeysRequest {
    [key: string]: any;
}

export interface UpdateKeyRequest {
    value: any;
}

// Database Types
export interface PersistenceConfig {
    autoSave: boolean;
    saveInterval?: number; // in milliseconds
    backupCount?: number;
    compression?: boolean;
}

export interface DatabaseMetadata {
    version: string;
    createdAt: string;
    lastSaved: string;
    totalHashMaps: number;
    totalElements: number;
}

// Validation Types
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface HashMapValidation {
    name: ValidationResult;
    keys: ValidationResult;
    values: ValidationResult;
}