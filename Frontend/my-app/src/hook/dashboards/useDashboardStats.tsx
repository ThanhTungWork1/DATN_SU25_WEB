import { useQuery } from "@tanstack/react-query"
import { getList } from "../../provider/dataProvider1"

export const useDashboardStats = () =>{
  return useQuery({
    queryKey:['dashboard'],
    queryFn: async() =>{
      try {
        console.log("Fetching dashboard stats...");
        
        const [userRes,productRes,orderRes,contactRes] =await Promise.all([
          getList({resource:"users"}),
          getList({resource:"products"}),
          getList({resource:"orders"}),
          getList({resource:"contacts"})
        ])
        
        console.log("Dashboard API responses:", {
          users: userRes,
          products: productRes,
          orders: orderRes,
          contacts: contactRes
        });
        
        const users = userRes.data?.length || 0;
        const products = productRes.data?.length || 0;
        const orders = orderRes.data?.length || 0;
        const contacts = contactRes.data?.length || 0;
        
        console.log("Dashboard stats:", {users, products, orders, contacts});
        
        return {users, products, orders, contacts};
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {users: 0, products: 0, orders: 0, contacts: 0};
      }
    }   
  })
}