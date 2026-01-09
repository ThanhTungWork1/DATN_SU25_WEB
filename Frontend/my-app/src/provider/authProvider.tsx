import axios from "axios"


const API_URL = `http://localhost:8000/api`

type registerParams = {
    resource: string,
    variables: any,
}
type loginParams = {
    resource: string,
    variables: any,
}
const dataProvider = {
    register: async ({ resource, variables }: registerParams) => {
        const response = await axios.post(`${API_URL}/${resource}`, variables);
        return response.data;
    },
    login: async ({ resource, variables }: loginParams) => {
        const response = await axios.post(`${API_URL}/${resource}`, variables);
        return response.data;
    }
}

export const { register, login } = dataProvider;
