import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Layouts
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';
import { SchoolAdminLayout } from './components/layout/SchoolAdminLayout';
import { TeacherLayout } from './components/layout/TeacherLayout';
import { StudentLayout } from './components/layout/StudentLayout';

// Public Pages
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { SchoolRegisterPage } from './features/auth/SchoolRegisterPage';
import { DocumentVerificationPage } from './features/verification/DocumentVerificationPage';
import { PublicSchoolPage } from './features/public-school/PublicSchoolPage';

// Super Admin Pages
import { SuperAdminDashboard } from './features/super-admin/SuperAdminDashboard';
import { SchoolApprovalsPage } from './features/super-admin/SchoolApprovalsPage';
import { MasterTemplateLibraryPage } from './features/super-admin/MasterTemplateLibraryPage';
import { SaaSSubscriptionPlansPage } from './features/super-admin/SaaSSubscriptionPlansPage';
import { GlobalAuditLogsPage } from './features/super-admin/GlobalAuditLogsPage';

import { SchoolBrandingPage } from './features/school-admin/SchoolBrandingPage';

// School Admin Pages
import { SchoolAdminDashboard } from './features/school-admin/SchoolAdminDashboard';
import { SchoolProfilePage } from './features/school-admin/SchoolProfilePage';
import { ClassesSectionsPage } from './features/academics/ClassesSectionsPage';
import { SubjectsPage } from './features/academics/SubjectsPage';
import { TimetablePage } from './features/timetable/TimetablePage';
import { StudentsListPage } from './features/students/StudentsListPage';
import { BulkStudentImportPage } from './features/students/BulkStudentImportPage';
import { TeachersListPage } from './features/teachers/TeachersListPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { FeesManagementPage } from './features/fees/FeesManagementPage';
import { ExamsManagementPage } from './features/exams/ExamsManagementPage';
import { ResultsEnginePage } from './features/results/ResultsEnginePage';
import { MarksheetGeneratorPage } from './features/documents/MarksheetGeneratorPage';
import { CertificateGeneratorPage } from './features/documents/CertificateGeneratorPage';
import { AdmitCardGeneratorPage } from './features/documents/AdmitCardGeneratorPage';
import { IdCardGeneratorPage } from './features/documents/IdCardGeneratorPage';
import { DocumentRecordsPage } from './features/documents/DocumentRecordsPage';
import { SchoolTemplatesPage } from './features/templates/SchoolTemplatesPage';
import { AdmissionsPipelinePage } from './features/admissions/AdmissionsPipelinePage';
import { NoticesManagementPage } from './features/notices/NoticesManagementPage';
import { HomeworkManagementPage } from './features/homework/HomeworkManagementPage';
import { SchoolSettingsPage } from './features/school-admin/SchoolSettingsPage';

// Teacher & Student Pages
import { TeacherDashboardPage } from './features/teacher/TeacherDashboardPage';
import { StudentDashboardPage } from './features/student/StudentDashboardPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/verify" element={<DocumentVerificationPage />} />
            <Route path="/verify/:code" element={<DocumentVerificationPage />} />
            <Route path="/school/:slug" element={<PublicSchoolPage />} />

            {/* School Admin Protected Routes */}
            <Route
              path="/school"
              element={
                <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
                  <SchoolAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/school/dashboard" replace />} />
              <Route path="dashboard" element={<SchoolAdminDashboard />} />
              <Route path="branding" element={<SchoolBrandingPage />} />
              <Route path="profile" element={<SchoolProfilePage />} />
              <Route path="classes" element={<ClassesSectionsPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="students" element={<StudentsListPage />} />
              <Route path="students/import" element={<BulkStudentImportPage />} />
              <Route path="teachers" element={<TeachersListPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="fees" element={<FeesManagementPage />} />
              <Route path="exams" element={<ExamsManagementPage />} />
              <Route path="results" element={<ResultsEnginePage />} />
              <Route path="documents/marksheets" element={<MarksheetGeneratorPage />} />
              <Route path="documents/certificates" element={<CertificateGeneratorPage />} />
              <Route path="documents/admit-cards" element={<AdmitCardGeneratorPage />} />
              <Route path="documents/id-cards" element={<IdCardGeneratorPage />} />
              <Route path="documents/records" element={<DocumentRecordsPage />} />
              <Route path="templates" element={<SchoolTemplatesPage />} />
              <Route path="admissions" element={<AdmissionsPipelinePage />} />
              <Route path="notices" element={<NoticesManagementPage />} />
              <Route path="homework" element={<HomeworkManagementPage />} />
              <Route path="settings" element={<SchoolSettingsPage />} />
            </Route>

            {/* Super Admin Aliases -> School Admin */}
            <Route path="/admin" element={<Navigate to="/school/dashboard" replace />} />
            <Route path="/admin/branding" element={<Navigate to="/school/branding" replace />} />
            <Route path="/admin/profile" element={<Navigate to="/school/profile" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/school/dashboard" replace />} />

            {/* Teacher Protected Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN']}>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboardPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="marks" element={<ExamsManagementPage />} />
              <Route path="homework" element={<HomeworkManagementPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="notices" element={<NoticesManagementPage />} />
            </Route>

            {/* Student & Parent Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'PARENT', 'SCHOOL_ADMIN', 'SUPER_ADMIN']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboardPage />} />
              <Route path="results" element={<StudentDashboardPage />} />
              <Route path="attendance" element={<StudentDashboardPage />} />
              <Route path="fees" element={<StudentDashboardPage />} />
              <Route path="documents" element={<StudentDashboardPage />} />
              <Route path="homework" element={<StudentDashboardPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="notices" element={<NoticesManagementPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
