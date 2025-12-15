// src/app/team-board/page.tsx
//
//import dynamic from "next/dynamic";

// 🧠 Dynamically import Board to avoid SSR issues
//const Board = dynamic(() => import("@/app/components/Board"), { ssr: false });
import Board from '@/app/components/Board';

export default function TeamBoardPage() {
  return (
    <div>
      <Board />
    </div>
  );
}
