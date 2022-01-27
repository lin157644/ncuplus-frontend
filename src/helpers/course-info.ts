import { store, ToastType } from "@/plugins/store";
import axios, { AxiosResponse } from "axios";

export async function reaction(
  target: string,
  operation: string,
  id: number,
  targetArray: any[]
) {
  try {
    let response: AxiosResponse<any, any>;
    if (target === "comment")
      response = await axios.post(
        process.env.VITE_APP_API_URL + `/course-info/${target}/${operation}`,
        { commentId: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    else
      response = await axios.post(
        process.env.VITE_APP_API_URL + `/course-info/${target}/${operation}`,
        { reviewId: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

    if (operation === "like") {
      targetArray
        .find((targetData) => targetData.id === id)
        .likes.push(response.data.data);
    } else {
      targetArray
        .find((targetData) => targetData.id === id)
        .dislikes.push(response.data.data);
    }
    await store.dispatch("pushToast", {
      type: ToastType.SUCCESS,
      message: "操作成功",
    });
  } catch (error: any) {
    let message;
    if (error.response.data.statusCode === 401) message = "尚未登入";
    else if (error.response.data.statusCode === 403) {
      if (
        (error.response.data.message as string).startsWith(
          "You cannot like or dislike your own"
        )
      ) {
        message = "你不能推噓自己的內容!";
      } else if (
        (error.response.data.message as string).startsWith(
          "You have already liked or disliked"
        )
      ) {
        message = "你已經為這篇內容推噓過了!";
      }
    }
    await store.dispatch("pushToast", {
      type: ToastType.ERROR,
      message: message,
    });
  }
}

export async function add(
  target: string,
  id: string,
  content: string,
  targetArray: any[]
) {
  if (content === "") return;
  try {
    let response = await axios.post(
      process.env.VITE_APP_API_URL + `/course-info/${target}`,
      { courseId: id, content: content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    targetArray.push({ ...response.data.data, likes: [], dislikes: [] });

    await store.dispatch("pushToast", {
      type: ToastType.SUCCESS,
      message: "操作成功",
    });
  } catch (error: any) {
    let message = "未知錯誤";
    if (error.response.data.statusCode === 401) message = "尚未登入";

    await store.dispatch("pushToast", {
      type: ToastType.ERROR,
      message: message,
    });
  }
}

export async function edit(
  target: string,
  id: number,
  content: string,
  targetArray: any[]
) {
  if (content === "") return;
  try {
    let response: AxiosResponse<any, any>;
    if (target === "comment")
      response = await axios.post(
        process.env.VITE_APP_API_URL + `/course-info/${target}/edit`,
        { commentId: id, content: content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    else
      response = await axios.post(
        process.env.VITE_APP_API_URL + `/course-info/${target}/edit`,
        { reviewId: id, content: content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

    const targetData = targetArray.find((targetData) => targetData.id === id);
    targetData.content = content;
    targetData.updatedAt = response.data.data.updatedAt;

    await store.dispatch("pushToast", {
      type: ToastType.SUCCESS,
      message: "操作成功",
    });
  } catch (error: any) {
    let message = "未知錯誤";
    if (error.response.data.statusCode === 401) message = "尚未登入";
    else if (error.response.data.statusCode === 403) message = "無此權限";

    await store.dispatch("pushToast", {
      type: ToastType.ERROR,
      message: message,
    });
  }
}

export async function del(target: string, id: number, targetArray: any[]) {
  try {
    let response: AxiosResponse<any, any>;
    if (target === "comment")
      response = await axios.post(
        process.env.VITE_APP_API_URL + `/course-info/${target}/delete`,
        { commentId: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    else
      response = await axios.post(
        process.env.VITE_APP_API_URL + `/course-info/${target}/delete`,
        { reviewId: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

    targetArray.splice(
      targetArray.findIndex((targetData) => targetData.id === id),
      1
    );

    await store.dispatch("pushToast", {
      type: ToastType.SUCCESS,
      message: "操作成功",
    });
  } catch (error: any) {
    let message = "未知錯誤";
    if (error.response.data.statusCode === 401) message = "尚未登入";
    else if (error.response.data.statusCode === 403) message = "無此權限";

    await store.dispatch("pushToast", {
      type: ToastType.ERROR,
      message: message,
    });
  }
}

export async function uploadPastExam(
  courseId: string,
  uploadData: {
    year: string;
    description: string;
    file: File;
  },
  pastExamArray: any[]
) {
  if (
    !uploadData.file ||
    uploadData.year === "" ||
    uploadData.description === ""
  ) {
    store.dispatch("pushToast", {
      type: ToastType.WARNING,
      message: "請填寫完整資料",
    });
    return;
  }
  const formdata = new FormData();
  formdata.append("courseId", courseId);
  formdata.append("file", uploadData.file);
  formdata.append("year", uploadData.year);
  formdata.append("description", uploadData.description);
  try {
    const resp = await axios.post(
      process.env.VITE_APP_API_URL + `/course-info/past-exam/upload`,
      formdata,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    store.dispatch("pushToast", {
      type: ToastType.SUCCESS,
      message: "上傳成功",
    });

    pastExamArray.push(resp.data.data);
  } catch (error: any) {
    let message = "上傳時發生錯誤";
    if (error.response.data.statusCode === 401) message = "尚未登入";
    else if (error.response.data.statusCode === 400) message = "檔案不合法";
    store.dispatch("pushToast", {
      type: ToastType.ERROR,
      message: message,
    });
  }
}
