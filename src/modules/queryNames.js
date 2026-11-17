import axios from "axios";
import { BACKEND_URI, QUERIES_PATH_PART } from "./const";

export const queryNameExists = async (name, excludedQueryId) => {
    const response = await axios.get(`${BACKEND_URI}${QUERIES_PATH_PART}`);
    const queries = Array.isArray(response.data)
        ? response.data
        : [response.data];

    return queries.some(
        (query) =>
            query?.name === name &&
            (excludedQueryId === undefined || query?.id !== excludedQueryId),
    );
};
