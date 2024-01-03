import ApplicationContext from "../applicationContext/ApplicationContext";

export const postProject = async (item) => {
    const api_version = ApplicationContext.get().helpers().backEndConfig.apiVersion;

    // TODO: Something something project type.
    const newProject = { ...item, project_type: "RESEARCH" };

    delete newProject.id;
    delete newProject.selected_project_type;

    const responseData = await ApplicationContext.get()
        .helpers()
        .callBackend(`/api/${api_version}/research-projects/`, "POST", newProject)
        .then(function (response) {
            console.log(response);
            return response;
        })
        .catch(function (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.newProject);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
            }
            console.log(error.config);
        });

    return responseData;
};
