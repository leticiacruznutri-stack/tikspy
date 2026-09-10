"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Film,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  getSchedule,
  getSessionsForDate,
  getProductById,
  updateCombo,
  getHooks,
  getBodies,
  getCTAs,
} from "@/lib/store";
import { ANGLES } from "@/lib/angles";
import type { VideoCombo, GravacaoSession } from "@/lib/types";

type TabType = "semana" | "sessoes";

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
}

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function AgendaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("semana");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [sessionDate, setSessionDate] = useState(formatDateISO(new Date()));
  const [sessions, setSessions] = useState<GravacaoSession[]>([]);
  const [weekData, setWeekData] = useState<
    { date: Date; dateStr: string; combos: VideoCombo[] }[]
  >([]);
  const [checkedCombos, setCheckedCombos] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);

  const getPieceText = useCallback((id: string): string => {
    const allPieces = [...getHooks(), ...getBodies(), ...getCTAs()];
    return allPieces.find((p) => p.id === id)?.text || "...";
  }, []);

  const loadWeek = useCallback(() => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = formatDateISO(date);
      days.push({
        date,
        dateStr,
        combos: getSchedule(dateStr),
      });
    }
    setWeekData(days);
  }, [weekStart]);

  const loadSessions = useCallback(() => {
    setSessions(getSessionsForDate(sessionDate));
  }, [sessionDate]);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const prevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const nextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const todayStr = formatDateISO(new Date());

  const markSessionFilmed = (session: GravacaoSession) => {
    for (const combo of session.combos) {
      updateCombo(combo.id, { status: "filming" });
    }
    loadSessions();
    setTick((t) => t + 1);
  };

  const toggleComboCheck = (comboId: string) => {
    setCheckedCombos((prev) => {
      const next = new Set(prev);
      if (next.has(comboId)) {
        next.delete(comboId);
        updateCombo(comboId, { status: "planned" });
      } else {
        next.add(comboId);
        updateCombo(comboId, { status: "filming" });
      }
      return next;
    });
    loadSessions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Agenda</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          Planeje e organize suas sessoes de gravacao
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white border border-[#e8e0d4] p-1 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("semana")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "semana"
              ? "bg-[#1a1a2e] text-white"
              : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea]"
          }`}
        >
          <Calendar size={16} />
          Semana
        </button>
        <button
          onClick={() => setActiveTab("sessoes")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "sessoes"
              ? "bg-[#1a1a2e] text-white"
              : "text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f0ea]"
          }`}
        >
          <Film size={16} />
          Sessoes
        </button>
      </div>

      {/* Tab: Semana */}
      {activeTab === "semana" && (
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevWeek}
              className="rounded-xl p-2 bg-white border border-[#e8e0d4] text-[#1a1a2e] hover:bg-[#f5f0ea] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-[#1a1a2e]">
              {weekData[0]?.date.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
              })}{" "}
              -{" "}
              {weekData[4]?.date.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              onClick={nextWeek}
              className="rounded-xl p-2 bg-white border border-[#e8e0d4] text-[#1a1a2e] hover:bg-[#f5f0ea] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Week grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {weekData.map(({ date, dateStr, combos }) => {
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={dateStr}
                  className={`rounded-2xl bg-white border p-4 shadow-sm min-h-[160px] ${
                    isToday
                      ? "border-[#fe2c55] ring-1 ring-[#fe2c55]/20"
                      : "border-[#e8e0d4]"
                  }`}
                >
                  <p
                    className={`text-xs font-medium mb-3 capitalize ${
                      isToday ? "text-[#fe2c55]" : "text-[#9ca3af]"
                    }`}
                  >
                    {formatDateShort(date)}
                    {isToday && (
                      <span className="ml-1.5 text-[10px] bg-[#fe2c55] text-white rounded-full px-1.5 py-0.5">
                        Hoje
                      </span>
                    )}
                  </p>

                  {combos.length === 0 ? (
                    <Link
                      href="/videos"
                      className="flex items-center justify-center h-20 rounded-xl border border-dashed border-[#e8e0d4] text-[#9ca3af] text-xs hover:bg-[#f5f0ea] hover:border-[#1a1a2e] transition-colors"
                    >
                      + Adicionar
                    </Link>
                  ) : (
                    <div className="space-y-1.5">
                      {combos.slice(0, 5).map((combo) => {
                        const product = getProductById(combo.productId);
                        const angle = ANGLES.find(
                          (a) => a.id === combo.angle
                        );
                        return (
                          <div
                            key={combo.id}
                            className="rounded-lg px-2 py-1.5 text-xs flex items-center gap-1.5"
                            style={{
                              backgroundColor: (angle?.color || "#9ca3af") + "15",
                            }}
                          >
                            <span>{product?.emoji}</span>
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: angle?.color }}
                            />
                            <span className="truncate text-[#1a1a2e]">
                              {getPieceText(combo.hookId).slice(0, 30)}...
                            </span>
                          </div>
                        );
                      })}
                      {combos.length > 5 && (
                        <p className="text-[10px] text-[#9ca3af] text-center">
                          +{combos.length - 5} mais
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Sessoes */}
      {activeTab === "sessoes" && (
        <div className="space-y-4">
          {/* Date picker */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#1a1a2e]">Data:</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="rounded-xl border border-[#e8e0d4] px-3 py-2 text-sm bg-white text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e]"
            />
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#e8e0d4] p-12 shadow-sm text-center">
              <Film
                size={40}
                className="mx-auto mb-3 text-[#9ca3af] opacity-50"
              />
              <p className="text-[#9ca3af] text-sm mb-2">
                Nenhuma sessao agendada
              </p>
              <Link
                href="/videos"
                className="text-sm text-[#1a1a2e] font-medium hover:underline"
              >
                Montar combos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, idx) => {
                const product = getProductById(session.productId);
                const angle = ANGLES.find((a) => a.id === session.angle);

                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-[#e8e0d4] p-5 shadow-sm"
                  >
                    {/* Session header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{product?.emoji}</span>
                        <span className="text-sm font-semibold text-[#1a1a2e]">
                          {product?.name}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: angle?.color }}
                        >
                          {angle?.emoji} {angle?.label}
                        </span>
                        <span className="text-xs text-[#9ca3af]">
                          ({session.combos.length} videos)
                        </span>
                      </div>
                      <button
                        onClick={() => markSessionFilmed(session)}
                        className="flex items-center gap-1.5 rounded-xl bg-[#22c55e] text-white px-3 py-2 text-xs font-medium hover:bg-[#16a34a] transition-colors"
                      >
                        <CheckCheck size={14} />
                        Marcar sessao como gravada
                      </button>
                    </div>

                    {/* Combo list */}
                    <div className="space-y-2">
                      {session.combos.map((combo) => (
                        <div
                          key={combo.id}
                          className="flex items-center gap-3 rounded-xl border border-[#e8e0d4] px-3 py-2.5"
                        >
                          <button
                            onClick={() => toggleComboCheck(combo.id)}
                            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0 ${
                              checkedCombos.has(combo.id) ||
                              combo.status === "filming"
                                ? "bg-[#22c55e] border-[#22c55e] text-white"
                                : "border-[#e8e0d4] hover:border-[#1a1a2e]"
                            }`}
                          >
                            {(checkedCombos.has(combo.id) ||
                              combo.status === "filming") && (
                              <Check size={12} />
                            )}
                          </button>
                          <p
                            className={`text-xs flex-1 ${
                              checkedCombos.has(combo.id) ||
                              combo.status === "filming"
                                ? "text-[#9ca3af] line-through"
                                : "text-[#1a1a2e]"
                            }`}
                          >
                            {getPieceText(combo.hookId)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
