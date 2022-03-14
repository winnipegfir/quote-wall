import {Card} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import DOMPurify from "dompurify";

export default function (props) {
    const quote = props.quote;
    const showCopy = props.copy;
    const navigate = useNavigate();

    function goToQuote(uuid) {
        navigate('/quote/' + uuid);
    }

    return (
        <Card>
            <Card.Body className="d-flex flex-column">
                <i className="mb-1" dangerouslySetInnerHTML={{ __html: niceQuote(quote.content) }} />
                <div className="mt-auto d-flex flex-row text-white-50">
                    <small className="overflow-auto">
                        {quote.name ?? "Anonymous"}
                    </small>
                    <small className="ms-auto">
                        { niceDateTime(quote.created_at) }
                        {
                            showCopy && <FontAwesomeIcon className="ps-2 text-white-50" icon={faUpRightFromSquare} onClick={() => { goToQuote(quote.uuid) }} />
                        }
                    </small>
                </div>
            </Card.Body>
        </Card>
    );
}

function niceDateTime(timestamp) {
    const dateObject = new Date(timestamp);

    return dateObject.toLocaleDateString([],{year:"numeric", month:"long", day:"numeric"}) + " " +
        dateObject.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function niceQuote(str){
    return DOMPurify.sanitize(str.replace(/(?:\r\n|\r|\n)/g, '<br>'));
}
