import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard"; // ダッシュボード
import SubjectSelect from "@/pages/subject-select"; // 教科から科目を選択するページ
import SubjectDashboard from "@/pages/subject-dashboard"; // 科目詳細ページ
import TestCreation from "@/pages/test-creation";
import TakeTest from "@/pages/take-test";
import TestSession from "@/pages/test-session"; // テスト実行ページ
import Admin from "@/pages/admin"; // 管理者ページ
import UpdateSetIds from "@/pages/update-set-ids"; // セットID更新ページ
import Landing from "@/pages/landing"; // ランディングページ
import Layout from "./components/layout/Layout";

function App() {
  return (
    <TooltipProvider>
      <Switch>
        <Route path="/">
          <Landing />
        </Route>
        <Route path="/dashboard">
          <Layout>
            <Dashboard />
          </Layout>
        </Route>
        <Route path="/subjects/:category">
          <Layout>
            <SubjectSelect />
          </Layout>
        </Route>
        <Route path="/subject/:subject">
          <Layout>
            <SubjectDashboard />
          </Layout>
        </Route>
        <Route path="/subject/:subject/take-test">
          <Layout>
            <TakeTest />
          </Layout>
        </Route>
        <Route path="/subject/:subject/take-test/:bookId/:chapterId/:setId">
          <Layout>
            <TestSession />
          </Layout>
        </Route>
        <Route path="/test-creation">
          <Layout>
            <TestCreation />
          </Layout>
        </Route>
        <Route path="/admin">
          <Layout>
            <Admin />
          </Layout>
        </Route>
        <Route path="/admin/update-set-ids">
          <Layout>
            <UpdateSetIds />
          </Layout>
        </Route>
        <Route>
          <Layout>
            <NotFound />
          </Layout>
        </Route>
      </Switch>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
