import React, { useState } from 'react';
import { MemberRecord } from '../types/memberTypes';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
} from 'lucide-react';

interface MemberManagerProps {
  members: MemberRecord[];
  onAddMember: (member: Omit<MemberRecord, 'id'>) => void;
  onUpdateMember: (member: MemberRecord) => void;
  onDeleteMember: (id: string) => void;
  onSelectMemberForLoan?: (member: MemberRecord) => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onSelectMemberForLoan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    memberNo: '',
    name: '',
    nik: '',
    phone: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const handleOpenAdd = () => {
    const nextNum = String(members.length + 1).padStart(3, '0');
    setEditingMember(null);
    setFormData({
      memberNo: `KOP-${nextNum}`,
      name: '',
      nik: '',
      phone: '',
      address: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: MemberRecord) => {
    setEditingMember(member);
    setFormData({
      memberNo: member.memberNo,
      name: member.name,
      nik: member.nik,
      phone: member.phone,
      address: member.address,
      joinDate: member.joinDate,
      status: member.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.memberNo) return;

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        ...formData,
      });
    } else {
      onAddMember(formData);
    }
    setIsModalOpen(false);
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nik.includes(searchTerm) ||
      m.phone.includes(searchTerm);

    const matchStatus = statusFilter === 'ALL' ? true : m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Pencatatan Data Anggota Koperasi
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>{members.length} Terdaftar</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Basis data keanggotaan koperasi, identitas KTP/NIK, kontak, dan status keanggotaan.
              </p>
            </div>
          </div>

          <div className="no-print flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Anggota Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="no-print mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, No. Anggota, NIK, No. HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all border ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    st === 'ACTIVE'
                      ? 'bg-emerald-400'
                      : st === 'INACTIVE'
                      ? 'bg-rose-400'
                      : 'bg-indigo-400'
                  }`}
                ></span>
                <span>
                  {st === 'ALL' ? 'Semua' : st === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table List of Members */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4 w-32">No. Anggota</th>
              <th className="py-3 px-4">Nama Lengkap & NIK</th>
              <th className="py-3 px-4">Kontak & Alamat</th>
              <th className="py-3 px-4">Tgl Gabung</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right no-print">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>Belum ada data anggota yang sesuai dengan pencarian.</span>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member, idx) => (
                <tr
                  key={member.id}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-950">
                    <span className="px-2 py-1 bg-slate-100 rounded-lg border border-slate-200/70 font-mono text-[11px]">
                      {member.memberNo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {member.name}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      <span>NIK: {member.nik || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{member.phone || '-'}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{member.address || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{member.joinDate}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        member.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      ></span>
                      <span>{member.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right no-print">
                    <div className="flex items-center justify-end gap-1.5">
                      {onSelectMemberForLoan && member.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => onSelectMemberForLoan(member)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-all"
                          title="Buatkan pengajuan pinjaman untuk anggota ini"
                        >
                          + Pinjaman
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        title="Edit Anggota"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMember(member.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit Member */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingMember ? 'Edit Data Anggota' : 'Pendaftaran Anggota Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    No. Anggota: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.memberNo}
                    onChange={(e) => setFormData({ ...formData, memberNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Contoh: KOP-001"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status Keanggotaan:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'ACTIVE' | 'INACTIVE',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Aktif (ACTIVE)</option>
                    <option value="INACTIVE">Non-Aktif (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Nama sesuai KTP"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    NIK / No. KTP (16 Digit):
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="3201..."
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    No. Telepon / WhatsApp:
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="0812..."
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alamat Lengkap Domisili:
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Jl. / RT / RW / Desa / Kecamatan"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tanggal Bergabung:
                </label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-95"
                >
                  {editingMember ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
