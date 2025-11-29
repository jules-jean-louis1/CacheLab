import { ValidationResult, HashMapValidation } from "../types/types";

export class Validator {
    // Validation du nom de HashMap
    static validateHashMapName(name: string): ValidationResult {
        const errors: string[] = [];

        if (!name || typeof name !== 'string') {
            errors.push("Name is required and must be a string");
        } else {
            if (name.length < 1) {
                errors.push("Name cannot be empty");
            }
            if (name.length > 50) {
                errors.push("Name cannot exceed 50 characters");
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
                errors.push("Name can only contain letters, numbers, hyphens, and underscores");
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validation des clés
    static validateKey(key: string): ValidationResult {
        const errors: string[] = [];

        if (!key || typeof key !== 'string') {
            errors.push("Key is required and must be a string");
        } else {
            if (key.length < 1) {
                errors.push("Key cannot be empty");
            }
            if (key.length > 100) {
                errors.push("Key cannot exceed 100 characters");
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validation des valeurs
    static validateValue(value: any): ValidationResult {
        const errors: string[] = [];

        if (value === undefined) {
            errors.push("Value cannot be undefined");
        }

        // Vérifier la taille sérialisée pour éviter des valeurs trop grandes
        try {
            const serialized = JSON.stringify(value);
            if (serialized.length > 10000) { // 10KB limit
                errors.push("Value is too large (maximum 10KB when serialized)");
            }
        } catch (e) {
            errors.push("Value must be serializable to JSON");
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validation complète pour les données de HashMap
    static validateHashMapData(data: Record<string, any>): HashMapValidation {
        const result: HashMapValidation = {
            name: { isValid: true, errors: [] },
            keys: { isValid: true, errors: [] },
            values: { isValid: true, errors: [] }
        };

        // Valider chaque paire clé-valeur
        for (const [key, value] of Object.entries(data)) {
            const keyValidation = this.validateKey(key);
            const valueValidation = this.validateValue(value);

            if (!keyValidation.isValid) {
                result.keys.isValid = false;
                result.keys.errors.push(...keyValidation.errors.map(err => `Key "${key}": ${err}`));
            }

            if (!valueValidation.isValid) {
                result.values.isValid = false;
                result.values.errors.push(...valueValidation.errors.map(err => `Value for "${key}": ${err}`));
            }
        }

        return result;
    }

    // Validation des paramètres de requête
    static validateRequest(body: any, requiredFields: string[]): ValidationResult {
        const errors: string[] = [];

        if (!body || typeof body !== 'object') {
            errors.push("Request body is required and must be an object");
            return { isValid: false, errors };
        }

        for (const field of requiredFields) {
            if (!(field in body) || body[field] === undefined || body[field] === null) {
                errors.push(`Field '${field}' is required`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}