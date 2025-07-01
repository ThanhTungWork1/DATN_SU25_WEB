import axios from "axios"
import { config } from "../api/axios";
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

type getListType = {
    resource: string;
}
type getOneType = {
    resource: string;
    id: number
}
type createType = {
    resource: string;
    variables: any;
}
type updateType = {
    resource: string;
    variables: any;
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
    },
    


    getList: async ({ resource }: getListType) => {
        const response = await config.get(`/${resource}`);
        return {
            data: response.data
        }
    },
    createOne: async ({ resource, variables }: createType) => {
        const response = await config.post(`/${resource}`, variables);
        return {
            data: response.data
        }
    },
    updateOne: async ({ resource, id, variables }: updateType) => {
    const response = await config.put(`/${resource}/${id}`, variables);
    return {
        data: response.data
    };
}

}


export const {getOne, getUpdateProfile, updateOne, createOne, getList} = dataProvider;