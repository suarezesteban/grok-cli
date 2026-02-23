import React from "react";
import { Box, Text } from "ink";

interface ChatInputProps {
  input: string;
  cursorPosition: number;
  isProcessing: boolean;
  isStreaming: boolean;
}

export function ChatInput({
  input,
  cursorPosition,
  isProcessing,
  isStreaming,
}: ChatInputProps) {
  const beforeCursor = input.slice(0, cursorPosition);
  const afterCursor = input.slice(cursorPosition);

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
                <Text>
                  {beforeCursorInLine}
                  {showCursor && (
                    <Text backgroundColor="white" color="black">
                      {cursorChar}
                    </Text>
                  )}
                  {!showCursor && cursorChar !== " " && cursorChar}
                  {afterCursorInLine}
                </Text>
              )}
            </Box>
          );
        } else {
          return (
            <Box key={index} height={1}>
              <Text color={promptColor}>{promptChar} </Text>
              <Text>{line}</Text>
            </Box>
          );
        }
      })}
    </Box>
  );
}
