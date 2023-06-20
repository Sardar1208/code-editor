"use client";
import Image from "next/image";
import Prism from "prismjs";
import { useState, useRef } from "react";
import 'prismjs/themes/prism.css';

// TODO - breaking if we type characters like "=", "()" or go to a new line.
// TODO - breaking if we type in between at a random point

export default function Home() {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState("hello");

  function updateCode() {
    var editor = document.getElementById("main_input");
    const text = editor ? editor.innerText : "";

    // Get the cursor position before doing any changes
    var currentPosition;
    var selection = window.getSelection();

    // loops through all the nodes backwards starting from the current node that cursor is on
    // to the first node and calculate the total offset of the cursor pointer
    if (selection!.rangeCount > 0) {
      var range = selection!.getRangeAt(0);
      var startOffset = range.startOffset;
      var totalOffset = startOffset;

      var mainNode: any = range.startContainer;
      mainNode = mainNode.parentElement.previousSibling || mainNode.previousSibling;
      while (mainNode != null) {
        if (mainNode.nodeType === Node.TEXT_NODE) {
          totalOffset += mainNode.nodeValue!.length;
        }else {
          totalOffset += mainNode.firstChild!.nodeValue!.length;
        }
        mainNode = mainNode.previousSibling;
      }

      console.log("Total offset: " + totalOffset.toString() + "for text: " + text);
      currentPosition = totalOffset;
    }


    // Generate the highlighted code using Prism
    if (currentPosition != null) {
      var html = Prism.highlight(
        text,
        Prism.languages.javascript,
        "javascript"
      );

      // Inject the new highlighted code
      if (editor != null) {
        editor.innerHTML = html;
      }

      var childNodes = editorRef.current.childNodes;
      var count = 0; // Maintaines the the offset for the new cursor position
      var totalCount = 0; // total count of the index while looping thorough the nodes
      var currentNode = null;

      // Loop through all child nodes and find the current node that the cursor was on.
      // find the offset that tell exactly which position the cursor was on in the current node
      for (var node of childNodes) {
        // nodeType = 3 means its a text node
        if (node.nodeType == 3) {
          totalCount += node.length;
          if (count + node.length < currentPosition) {
            count += node.length;
          }
          // nodeType = 1 means its a span node
        } else if (node.nodeType == 1) {
          if (count + node.firstChild.length < currentPosition) {
            count += node.firstChild.length;
          }
          totalCount += node.firstChild.length;
        }

        if (totalCount >= currentPosition) {
          currentNode = node;
          break;
        }
      }

      // Restore the cursor position
      const selection = window.getSelection();
      const range = document.createRange();
      // TODO - optimize this
      try {
        // set the cursor position in case of text node
        // its causes an index error in case of span node
        range.setStart(currentNode, currentPosition - count);
      } catch (e) {
        console.log("error is : ", e);
        // set cursor position in case of span node
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
