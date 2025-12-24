import axios from "axios";
import { BASE_URL } from "../constants/env";

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});
