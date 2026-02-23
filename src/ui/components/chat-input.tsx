import React from "react";
import { Box, Text } from "ink";
import * as fs from "node:fs";

interface ChatInputProps {
  input: string;
  cursorPosition: number;
  isProcessing: boolean;
  isStreaming: boolean;
}

/**
 * Helper to render text with @file highlights
 */
function HighlightedText({ text }: { text: string }) {
  if (!text) return null;

  // Split text into parts (words and spaces)
  const parts = text.split(/(@[\w\-\.\/]+)/g);

  return (
    <Text>
      {parts.map((part, i) => {
        if (part.startsWith("@")) {
          const filePath = part.substring(1);
          const exists = fs.existsSync(filePath);
          return (
            <Text key={i} color={exists ? "magenta" : undefined}>
              {part}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export function ChatInput({
  input,
  cursorPosition,
  isProcessing,
  isStreaming,
}: ChatInputProps) {
  const lines = input.split("\n");

  // Calculate cursor position across lines
  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let totalChars = 0;

  for (let i = 0; i < lines.length; i++) {
    if (totalChars + lines[i].length >= cursorPosition) {
      currentLineIndex = i;
      currentCharIndex = cursorPosition - totalChars;
      break;
    }
    totalChars += lines[i].length + 1; // +1 for newline
  }

  const showCursor = !isProcessing && !isStreaming;
  const borderColor = isProcessing || isStreaming ? "yellow" : "blue";
  const promptColor = "cyan";

  // Display placeholder when input is empty
  const placeholderText = "Ask me anything...";
  const isPlaceholder = !input;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
      width="100%"
      paddingX={1}
      paddingY={0}
      marginTop={1}
    >
      {lines.map((line, index) => {
        const isCurrentLine = index === currentLineIndex;
        const promptChar = index === 0 ? "❯" : "│";

        if (isCurrentLine) {
          const beforeCursorInLine = line.slice(0, currentCharIndex);
          const cursorChar =
            line.slice(currentCharIndex, currentCharIndex + 1) || " ";
          const afterCursorInLine = line.slice(currentCharIndex + 1);

          return (
            <Box key={index} height={1}>
              <Text color={promptColor}>{promptChar} </Text>
              {isPlaceholder ? (
                <>
                  <Text color="gray" dimColor>
                    {placeholderText}
                  </Text>
                  {showCursor && (
                    <Text backgroundColor="white" color="black">
                      {" "}
                    </Text>
                  )}
                </>
              ) : (
                <Box>
                  <HighlightedText text={beforeCursorInLine} />
                  {showCursor && (
                    <Text backgroundColor="white" color="black">
                      {cursorChar}
                    </Text>
                  )}
                  {!showCursor && cursorChar !== " " && (
                    <HighlightedText text={cursorChar} />
                  )}
                  <HighlightedText text={afterCursorInLine} />
                </Box>
              )}
            </Box>
          );
        } else {
          return (
            <Box key={index} height={1}>
              <Text color={promptColor}>{promptChar} </Text>
              <HighlightedText text={line} />
            </Box>
          );
        }
      })}
    </Box>
  );
}
