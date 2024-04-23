import ApplicationContext from "../applicationContext/ApplicationContext";

export const apiLogin = async (provider, authCode) => {
    const responseData = await ApplicationContext.get().helpers().callBackend(`/auth/login/`, "post", {
        callbackUrl: window.location.href,
        code: authCode,
        provider: provider
    });
    return responseData;
};

export const apiLogout = async () => {
    const api_version = ApplicationContext.get().helpers().backEndConfig.apiVersion;

    const responseData = await ApplicationContext.get()
        .helpers()
        .callBackend(`/api/${api_version}/auth/logout/`, "post", {});
    return responseData;
};
