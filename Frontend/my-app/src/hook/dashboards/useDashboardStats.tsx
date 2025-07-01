import { useQuery } from "@tanstack/react-query"
import { getList } from "../../provider/dataProvider"

export const useDashboardStats = () =>{
  return useQuery({
    queryKey:['dashboard'],
    queryFn: async() =>{
      const [userRes,productRes,orderRes] =await Promise.all([
        getList({resource:"users"}),
        getList({resource:"products"}),
        getList({resource:"orders"})
      ])
      const users = userRes.data.length;
      const products = productRes.data.length;
      const orders = orderRes.data.length
      
      
      return {users,products,orders};
    }   
  })
}