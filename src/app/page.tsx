"use client";
import Prism from "prismjs";

import { useState, useRef } from "react";
import "prismjs/themes/prism.css";
import { CodeError } from "./utils/interfaces";
import Inspector from "./components/inspector";
const espree = require("espree");

// TODO - breaking if we type something in quotes "".

export default function Home() {
  const editorRef = useRef<any>(null);
  const linesRef = useRef<any>(null);
  const [code, setCode] = useState("// Write your code here");
  const [error, setError]: any = useState();

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
      // TODO - make a root node and do parentElement.previousSibling utill it is a direct child of the rootNode
      while (mainNode.parentElement != editor) {
        mainNode = mainNode.parentElement;
      }
      mainNode = mainNode.previousSibling;
      while (mainNode != null) {
        if (mainNode.nodeType === Node.TEXT_NODE) {
          totalOffset += mainNode.nodeValue!.length;
        } else {
          totalOffset += mainNode.innerText.length;
        }
        mainNode = mainNode.previousSibling;
      }

      console.log(
        "Total offset: " + totalOffset.toString() + "for text: " + text
      );
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
          if (count + node.innerText.length < currentPosition) {
            count += node.innerText.length;
          }
          totalCount += node.innerText.length;
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
        // in case its a span node, keep doing currentNode.firstChild until you get the text node
        while (currentNode.nodeType != 3) {
          currentNode = currentNode.firstChild;
        }
        // set the cursor position of the text node
        range.setStart(currentNode, currentPosition - count);
      } catch (e) {
        console.log("error is : ", e);
        // set cursor position to the end of the currentnode in case of an error
        range.setStartAfter(currentNode);
      }
      range.collapse(true);
      selection!.removeAllRanges();
      selection!.addRange(range);
    }
  }

  function parseCode() {
    var editor = document.getElementById("main_input");
    const text = editor ? editor.innerText : "";

    try {
      var res = espree.parse(text, {
        ecmaVersion: 2023,
        ecmaFeatures: { jsx: true },
      });

      setError(null);
    } catch (e: any) {
      console.log(e);
      var error: CodeError = {
        lineNumber: e.lineNumber || 0,
        index: e.index || 0,
        message: e.message || "",
        type: e.name || "",
      };
      setError(error);
    }
  }

  function manageNumofLines() {
    var editor = document.getElementById("main_input");
    var linesDiv = linesRef.current;
    const text = editor ? editor.innerText : "";

    var count = text.split("\n").length - 1;

    console.log(linesDiv.childNodes);

    if (linesDiv.childNodes.length > count) {
      // remove last child
      while (linesDiv.childNodes.length != count) {
        var lastLine = linesDiv.lastChild;
        linesDiv.removeChild(lastLine);
      }
    } else if (linesDiv.childNodes.length < count) {
      // increment the child

      while (linesDiv.childNodes.length != count) {
        var lastLine = linesDiv.lastChild?.textContent ?? 0;
        var lineNumberNode = document.createTextNode(
          (parseInt(lastLine!) + 1).toString()
        );
        const p = document.createElement("p");
        p.appendChild(lineNumberNode);
        linesDiv.appendChild(p);
        linesDiv.removeChild(p.ATTRIBUTE_NODE);
      }
    }
  }

  function exceuteCode() {
    var editor = document.getElementById("main_input");
    var output = document.getElementById("output");
    const text = editor ? editor.innerText : "";

    try {
      // replace console.logs with log.
      const log: any = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        log.push(...args);
        originalConsoleLog(...args);
      };
      // exceute the code
      var F = new Function(text);
      F.apply(null);

      // revert the console.log change
      console.log = originalConsoleLog;

      // create result in a new Node
      const result = document.createElement("div");
      log.forEach((element: string) => {
        const text = document.createElement("div");
        text.innerText = element;
        result.appendChild(text);
      });

      // Display the output
      output?.replaceChildren(result);
    } catch (e) {
      console.log("errors found: ", e);
    }
  }

  return (
    <main className="h-full w-full flex justify-between">
      <div className="flex gap-7 px-5 py-3">
        <div className="text-zinc-500" id="lines" ref={linesRef}>
          <p>1</p>
        </div>
        <pre>
          <code
            ref={editorRef}
            id="main_input"
            style={{ lineHeight: "20px" }}
            contentEditable="true"
            aria-multiline="true"
            content={code}
            onInput={(e) => {
              updateCode();
              parseCode();
              manageNumofLines();
            }}
            className="h-full w-full outline-none w-full h-full"
          >
            {code}
          </code>
        </pre>
      </div>

      <div className="h-full w-2/5 bg-slate-800 border-l-8 border-slate-900 p-8">
        <button
          className="bg-emerald-500 px-4 py-2 rounded-md mb-6"
          onClick={exceuteCode}
        >
          Run
        </button>
        <div id="output"></div>
      </div>
      <Inspector error={error} />
    </main>
  );
}
