import Image from "next/image";
import { CodeError } from "../utils/interfaces";

interface InspectorProps {
  error: CodeError;
}

export default function Inspector(props: InspectorProps) {
  return (
    <div className="min-h-[30%] bg-gray-800 w-full fixed bottom-0">
      <div className="bg-gray-900 py-2 px-10">
        <button>TERMINAL</button>
      </div>

      <div className="px-10 py-5">
        {props.error != null ? (
          <div className="flex items-center gap-3">
            <Image src={"/close.png"} alt="error icon" width={30} height={30} />
            <div>
              <span className="color-red">{props.error.type}: </span>{" "}
              <span>{props.error.message || ""}</span>
              <p>
                At line {props.error.lineNumber.toString()} : (
                {props.error.lineNumber.toString()},{" "}
                {props.error.index.toString()})
              </p>
            </div>
          </div>
        ) : (
          <div>No Issues found :)</div>
        )}
      </div>
    </div>
  );
}
