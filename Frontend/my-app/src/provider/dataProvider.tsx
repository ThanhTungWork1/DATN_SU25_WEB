import axios from "axios"
const Api = `http://localhost:3000`;

type getProfile = {
    resource: string;
    variable: any;
    id: number;
}

type getOneParam = {
    resource: string,
    id: number
}

const dataProvider = {

    getOne: async ({resource, id}: getOneParam) => {
        const responsive = await axios.get(`${Api}/${resource}/${id}`);
        return {
            data: responsive.data,
        }
    },

    getUpdateProfile: async ({resource, id, variable}: getProfile) => {
        const responsive = await axios.put(`${Api}/${resource}/${id}`, variable);
        return {
            data: responsive.data
        }
    }
}

export const {getOne, getUpdateProfile} = dataProvider;