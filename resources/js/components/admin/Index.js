import { useOutletContext } from "react-router-dom";

export default function () {
    const [auth] = useOutletContext();

    return (
        <div className="d-flex flex-column flex-fill justify-content-center px-2">
            <div className="mx-auto text-center">
                { auth && (
                    <>
                        <h5>Alright, you're logged in. Go do some quotes. <b>Now.</b></h5>
                        <img src="https://cdn.discordapp.com/attachments/857844725385003018/886112057995456512/unknown.png" />
                    </>

                ) }
                { !auth && (
                    <>
                        <h5>Aren't logged in? Give the <code>Login</code> button at the top a try.</h5>
                    </>
                )}

            </div>
        </div>
    )
}
