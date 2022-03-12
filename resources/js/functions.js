import Swal from "sweetalert2";

export async function redirectToRandomQuote(navigate) {
    axios.get("/api/quotes/random").then((res) => {
        if (!res.data.success)
            throw Error;

        navigate("/quote/" + res.data.uuid);
    }).catch((err) => {
        console.log(err);
        Swal.fire({
            icon: "error",
            text: "An error occurred."
        });
    });
}
