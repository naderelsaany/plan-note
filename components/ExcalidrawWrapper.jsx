'use client';

import { Excalidraw, MainMenu } from '@excalidraw/excalidraw';

export default function ExcalidrawWrapper(props) {
  return (
    <Excalidraw {...props}>
      <MainMenu>
        <MainMenu.DefaultItems.LoadScene />
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.Export />
        <MainMenu.DefaultItems.ClearCanvas />
        <MainMenu.DefaultItems.ToggleTheme />
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu>
    </Excalidraw>
  );
}
