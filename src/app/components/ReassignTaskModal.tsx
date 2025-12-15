"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface ReassignTaskModalProps {
  taskId: string;
  onClose: () => void;
  onReassign: (taskId: string, assigneeId: string) => void;
}

export default function ReassignTaskModal({ taskId, onClose, onReassign }: ReassignTaskModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState("");

  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/team-members");
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();
        setTeamMembers(data);
      } catch (err) {
        toast.error("Error fetching team members");
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = () => {
    if (!selectedMember) {
      toast.error("Please select a team member");
      return;
    }
    onReassign(taskId, selectedMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Reassign Task</h2>
        <select
          className="w-full border rounded px-3 py-2 mb-4"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">Select Team Member</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Reassign
        </button>
      </motion.div>
    </div>
  );
}
