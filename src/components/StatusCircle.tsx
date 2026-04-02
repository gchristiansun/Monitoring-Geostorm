
type dstStatus = 
    | "Quiet"
    | "Active"
    | "Minor Storm"
    | "Major Storm"
    | "Severe Storm"
    | "Moderate Storm"
    | "-"

type swStatus =
    | "Quiet"
    | "HSSWS"
    | "-"

type bzStatus = 
    | "Quiet"
    | "Warning"
    | "-"

type props = {
    status: dstStatus | swStatus | bzStatus;
}

export default function StatusCircle({ status }: props) {
    return (
        <div className="w-2 h-2 rounded-xl">
            {status === "Quiet" && <div className="w-full h-full bg-green-500 rounded-xl" />}
            {(status === "Active" || status === "HSSWS") && <div className="w-full h-full bg-yellow-500 rounded-xl" />}
            {(status === "Minor Storm" || status === "Warning") && <div className="w-full h-full bg-orange-500 rounded-xl" />}
            {(status === "Major Storm" || status === "Moderate Storm") && <div className="w-full h-full bg-red-500 rounded-xl" />}
            {status === "Severe Storm" && <div className="w-full h-full bg-purple-500 rounded-xl" />}
            {status === "-" && <div className="w-full h-full bg-gray-500 rounded-xl" />}          
        </div>
    )
}    