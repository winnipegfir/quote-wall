import {Col, Container, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import QuoteCard from "./QuoteCard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {Helmet, HelmetData} from "react-helmet-async";

let url = "/api/quotes";
const helmetData = new HelmetData({});

export default function () {
    const [ fetching, setFetching ] = useState(false);
    const [ isLoading, setLoading ] = useState(false);
    const [ end, setEnd ] = useState(false);
    const [ quotes, setQuotes ] = useState([]);

    async function getQuotes() {
        if (url == null) {
            return;
        }

        setLoading(true);

        await axios.get(url)
            .then((res) => {
                setQuotes(quotes => [...quotes, ...res.data.data]);

                if (res.data.next_page_url) {
                    url = res.data.next_page_url;
                } else {
                    setEnd(true);
                    url = null;
                }

                setFetching(false);
                setLoading(false);
            }).catch((err) => {
                console.log(err);
                setFetching(false);
                setLoading(false);
            });
    }

    function handleScroll() {
        let userScrollHeight = window.innerHeight + window.scrollY;
        let windowBottomHeight = document.documentElement.offsetHeight - 500;

        console.log("user", userScrollHeight);
        console.log("bottom", windowBottomHeight);

        if (userScrollHeight < windowBottomHeight)
            return;

        setFetching(true);
    }

    useEffect(() => {
        setFetching(true);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])

    useEffect(() => {
        if (!fetching)
            return;

        getQuotes();
    }, [fetching]);

    return (
        <div style={{ minHeight: "96vh" }}>
            <Helmet helmetData={helmetData}>
                <title>Winnipeg FIR Quotes</title>
                <meta property="description" content="All the greatest moments caught in the Winnipeg FIR... if you're on here somewhere, we're sorry." />
            </Helmet>

            <Container fluid>
                <Row>
                    {
                        quotes.length > 0 && (
                            quotes.map((quote) => (
                                <Col xl={3} lg={4} md={6} sm={12} className="mb-4" key={quote.uuid} >
                                    <QuoteCard quote={quote} copy={true} />
                                </Col>
                            ))
                        )
                    }
                    <Col md={12} className="mb-4 text-center">
                        { isLoading && (
                            <FontAwesomeIcon size="2x" icon={faSpinner} className="fa-spin" />
                        )}
                        {
                            end && (
                                <small className="text-white-50 fst-italic">You've reached the end... for <b>now</b></small>
                            )
                        }
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
