import { AVAILABLE_GOVERNANCE_PARAMETERS, MAX_PARAMETER_CHANGE_SIZE } from "@/config";
import { ParameterChange } from "./types";

export const generateJsonInput = (changes: ParameterChange[], allParameters: any[], validationErrors: string[]) => {
    const validChanges = changes.filter(
        (change) => change.parameter && change.value && !validationErrors[changes.indexOf(change)]
    );

    if (validChanges.length === 0) {
        return { jsonString: "", sizeWarning: null };
    }

    try {
        const parameterChanges = validChanges.map((change) => {
            const parameter = allParameters.find(
                (p) => p.id === change.parameter
            );

            let value: string | number = change.value;

            // Convert to appropriate type
            if (parameter?.type === "number") {
                value = Number(change.value);
            }

            return {
                parameter: change.parameter,
                value,
            };
        });

        const jsonString = JSON.stringify(parameterChanges, null, 2);
        const dataSize = new TextEncoder().encode(jsonString).length;

        let sizeWarning = null;
        if (dataSize >= MAX_PARAMETER_CHANGE_SIZE) {
            sizeWarning = `Parameter change data exceeds the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes. Please reduce the number of parameters or simplify the values.`;
        } else if (dataSize >= MAX_PARAMETER_CHANGE_SIZE * 0.8) {
            sizeWarning = `Parameter change data is approaching the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes.`;
        }

        return { jsonString, sizeWarning };
    } catch (e) {
        // If JSON parsing fails, just set the raw values
        const parameterChanges = validChanges.map((change) => ({
            parameter: change.parameter,
            value: change.value,
        }));
        const jsonString = JSON.stringify(parameterChanges, null, 2);
        const dataSize = new TextEncoder().encode(jsonString).length;

        let sizeWarning = null;
        if (dataSize >= MAX_PARAMETER_CHANGE_SIZE) {
            sizeWarning = `Parameter change data exceeds the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes. Please reduce the number of parameters or simplify the values.`;
        } else if (dataSize >= MAX_PARAMETER_CHANGE_SIZE * 0.8) {
            sizeWarning = `Parameter change data is approaching the maximum allowed size of ${MAX_PARAMETER_CHANGE_SIZE} bytes. Current size: ${dataSize} bytes.`;
        }

        return { jsonString, sizeWarning };
    }
};

export const validateParameterValue = (parameter: any, value: string): string => {
    if (!parameter) return "";

    if (parameter.type === "number") {
        const numValue = Number(value);

        if (isNaN(numValue)) {
            return "Value must be a number";
        } else if (parameter.min !== undefined && numValue < parameter.min) {
            return `Value must be at least ${parameter.min}`;
        } else if ('max' in parameter && typeof parameter.max === 'number' && numValue > parameter.max) {
            return `Value must be at most ${parameter.max}`;
        }
    } else if (parameter.type === "text") {
        if ('maxLength' in parameter && typeof parameter.maxLength === 'number' && value.length > parameter.maxLength) {
            return `Text must be at most ${parameter.maxLength} characters`;
        }
    }

    return "";
};


export const getAllParameters = () => {
    return Object.values(AVAILABLE_GOVERNANCE_PARAMETERS).flat();
};

export const getSelectedParameters = (changes: ParameterChange[]) => {
    return changes
        .map(change => change.parameter)
        .filter(param => param !== "");
};

export const getAvailableParameters = (changes: ParameterChange[], currentIndex: number) => {
    const selectedParams = getSelectedParameters(changes);
    return Object.entries(AVAILABLE_GOVERNANCE_PARAMETERS).map(([category, params]) => {
        // Filter out parameters that are already selected in other rows
        const availableParams = params.filter(param =>
            param.id === changes[currentIndex].parameter || !selectedParams.includes(param.id)
        );

        return {
            category,
            params: availableParams
        };
    });
};