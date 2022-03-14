import {useEffect} from "react";
import {useNavigate, useSearchParams} from 'react-router-dom';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-dark';

export default function () {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!searchParams.has('code') || !searchParams.has('state'))
            navigate("/auth/login/redirect");

        axios.get(`/api/auth/callback?code=${searchParams.get('code')}&state=${searchParams.get('state')}`)
            .then((res) => {
                Swal.fire({
                    icon: "success",
                    title: "Authenticated!",
                    text: "Welcome back!",
                    didClose: function () {
                        navigate("/admin");
                        window.location.reload();
                    }
                });
            })
            .catch((err) => {
                Swal.fire({
                    icon: "error",
                    html: err.response.data.error + "<br><br><code>Hint: " + err.response.data.hint + "</code>",
                    didClose: function () {
                        navigate("/admin");
                        window.location.reload();
                    }
                });
            });

    }, []);

    return (
        <>
            <div className="d-flex flex-column flex-fill justify-content-center">
                <div className="mx-auto text-center">
                    <h1 className="fw-bold">Authenticating...</h1>
                </div>
            </div>
        </>
    );
}
