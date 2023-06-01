"use client";
import Image from "next/image";
import Prism from "prismjs";
import { useState, useRef } from "react";

export default function Home() {
  const [cursorPosition, setCursorPosition] = useState(0);
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState("hello");

  function updateCode() {
    var editor = document.getElementById("main_input");
    const text = editor ? editor.innerText : "";
    // console.log("editor: ", editor?.innerText);
    // setCode(editor!.innerText);

    const currentPosition =
      window.getSelection()?.getRangeAt(0).startOffset || null;
    if (currentPosition != null) {
      setCursorPosition(currentPosition);

      // console.log("cursor position: ", cursorPosition);

      var html = Prism.highlight(
        text,
        Prism.languages.javascript,
        "javascript"
      );

      // Inject the new highlighted code
      if (editor != null) {
        editor.innerHTML = html;
      }

      console.log("child nodes: ", editorRef.current.childNodes);

      var childNodes = editorRef.current.childNodes;
      var count = 0;
      var totalCount = 0;
      var currentNode = null;

      for (var node of childNodes) {
        if (node.nodeType == 3) {
          totalCount += node.length;
          if(count + node.length < currentPosition){
            count += node.length;
          }
        } else if (node.nodeType == 1) {
          if(count + node.firstChild.length < currentPosition){
            count += node.firstChild.length;
          }
          totalCount += node.firstChild.length;
        }

        if (totalCount >= currentPosition) {
          currentNode = node;
        }
      }

      // Restore the cursor position
      const selection = window.getSelection();
      const range = document.createRange();
      try {
        range.setStart(node, currentPosition - count);
      }catch(e) {
        console.log("error is : ", e);
        range.setStartAfter(currentNode);
      }
      range.collapse(true);
      selection!.removeAllRanges();
      selection!.addRange(range);
    }
  }

  return (
    <main className="h-full w-full">
      <button onClick={() => console.log("changes made", code)}>get log</button>
      <pre>
        <code
          ref={editorRef}
          id="main_input"
          contentEditable="true"
          aria-multiline="true"
          content={code}
          onInput={(e) => {
            // console.log("changes made", e.target);
            updateCode();
          }}
          className="h-full w-full bg-grey-500"
        >
          {code}
        </code>
      </pre>

      {/* <div contentEditable="true">
        <span style={{ color: "yellow" }}>const</span> name = new;
      </div> */}
    </main>
  );
}
