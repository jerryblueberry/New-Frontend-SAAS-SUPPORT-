import api from "./axios";

export const fetchProgressNotes = async({timesheetId,workerId,page=1,limit=10}) => {
    const response = await api.get(`/progress-note/get/${timesheetId}`,{
        params:{workerId,page,limit}
    });
    return response.data
}