import {Helmet, HelmetData} from "react-helmet-async";

const helmetData = new HelmetData({});

export default function () {
    return (
        <>
            <Helmet helmetData={helmetData}>
                <title>Page Not Found</title>
                <meta property="og:title" content="404 | Not Found" />
            </Helmet>

            <div className="d-flex flex-column flex-fill justify-content-center">
                <div className="mx-auto text-center">
                    <h1 className="fw-bold">404</h1>
                    <h4>Page not found. <a className="text-decoration-none" href="/">Go home?</a></h4>
                </div>
            </div>
        </>
    )
}
