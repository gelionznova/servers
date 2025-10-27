// import { BASE_API } from "../utils/constants";

// export async function loginApi(formValue) {
//   try {
//     const url = `${BASE_API}/auth/login/`;
//     const params = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formValue),
//     };

//     const response = await fetch(url, params);

//     if (response.status !== 200) {
//       throw new Error("Usuario o contraseña incorrectos");
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// export async function getMeApi(token) {
//   try {
//     const url = `${BASE_API}/auth/me/`;
//     const params = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const response = await fetch(url, params);
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// export async function getUsersApi(token) {
//   try {
//     const url = `${BASE_API}/users/`;
//     const params = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };
//     const response = await fetch(url, params);
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// export async function addUserApi(data, token) {
//   try {
//     const url = `${BASE_API}/users/`;
//     const params = {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     };

//     const response = await fetch(url, params);
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// export async function updateUserApi(id, data, token) {
//   try {
//     const url = `${BASE_API}/users/${id}/`;
//     const params = {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     };

//     const response = await fetch(url, params);
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// export async function deleteUserApi(id, token) {
//   try {
//     const url = `${BASE_API}/users/${id}/`;
//     const params = {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const response = await fetch(url, params);
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// // api/user.js
// export async function getUserStatusApi(id, token) {
//   try {
//     const url = `${BASE_API}/users/status/${id}/`;
//     const params = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     const response = await fetch(url, params);
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

// src/api/user.js
import { BASE_API } from "../utils/constants";

export async function loginApi(formValue) {
  try {
    const url = `${BASE_API}/auth/login/`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValue),
    };

    const response = await fetch(url, params);

    if (response.status !== 200) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getMeApi(token) {
  try {
    const url = `${BASE_API}/auth/me/`;
    const params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

// Actualizar perfil del usuario (incluyendo avatar)
export async function updateProfileApi(data, token) {
  try {
    const url = `${BASE_API}/auth/me/`;
    const formData = new FormData();

    // Agregar todos los campos al FormData
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const params = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    const response = await fetch(url, params);
    if (!response.ok) throw new Error("Error actualizando perfil");
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Cambiar contraseña
export async function changePasswordApi(passwords, token) {
  try {
    const url = `${BASE_API}/auth/change-password/`;
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwords),
    };

    const response = await fetch(url, params);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Error al cambiar contraseña");
    }

    return result;
  } catch (error) {
    throw error;
  }
}

// Eliminar avatar del usuario actual
export async function deleteAvatarApi(token) {
  try {
    const url = `${BASE_API}/auth/me/`;
    const params = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    if (!response.ok) throw new Error("Error eliminando avatar");
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getUsersApi(token) {
  try {
    const url = `${BASE_API}/users/`;
    const params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function addUserApi(data, token) {
  try {
    const url = `${BASE_API}/users/`;
    const formData = new FormData();

    // Convertir data a FormData para soportar archivos
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function updateUserApi(id, data, token) {
  try {
    const url = `${BASE_API}/users/${id}/`;
    const formData = new FormData();

    // Convertir data a FormData para soportar archivos
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const params = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function deleteUserApi(id, token) {
  try {
    const url = `${BASE_API}/users/${id}/`;
    const params = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    if (response.status === 204) return {}; // No content
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

// Eliminar avatar de un usuario específico (admin)
export async function deleteUserAvatarApi(userId, token) {
  try {
    const url = `${BASE_API}/users/${userId}/delete_avatar/`;
    const params = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    if (!response.ok) throw new Error("Error eliminando avatar");
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getUserStatusApi(id, token) {
  try {
    const url = `${BASE_API}/users/status/${id}/`;
    const params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}
