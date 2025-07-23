import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = `http://localhost:3000`;

type useSigninParams = {
    resource: string,
}

const useLogin = ({ resource }: useSigninParams) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (variables: any) => {
            // Đăng nhập với json-server: GET /users?email=...&password=...
            const { email, password } = variables;
            const response = await axios.get(`${API_URL}/${resource}?email=${email}&password=${password}`);
            if (response.data && response.data.length > 0) {
                // Đăng nhập thành công, trả về user đầu tiên
                return { data: response.data[0] };
            } else {
                throw new Error("Email hoặc mật khẩu không đúng!");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [resource]
            })
        }
    })
}

export default useLogin;