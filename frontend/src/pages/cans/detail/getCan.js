import { setCan } from "./canDetailSlice";
import ApplicationContext from "../../../applicationContext/ApplicationContext";

export const getCan = (id) => {
    return async (dispatch, getState) => {
        const responseData = await ApplicationContext.get().helpers().callBackend(`/ops/cans/${id}`, "get");
        dispatch(setCan(responseData));
    };
};
