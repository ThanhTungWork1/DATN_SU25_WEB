// // import { useQuery } from "react-query";
// import axios from "axios";

// export const useVouchers = () => {
//   const fetchVouchers = async () => {
//     const response = await axios.get("http://localhost:5173/api/vouchers");
//     return response.data; // Đảm bảo rằng backend trả về mảng
//   };

//   const {
//     data: vouchers = [],
//     isLoading,
//     isError,
//     refetch,
//   } = useQuery("vouchers", fetchVouchers);

//   return { vouchers, isLoading, isError, refetch };
// };
