import { AuthControls } from "./auth-controls";
import { DailyGoalSlider } from "./daily-goal-slider";
import { Button, Card, FormField, ScreenContainer, SectionHeading } from "./primitives";
import { ThemeControl } from "./theme-control";

export function SettingsPanel() {
  return (
    <ScreenContainer>
      <header className="screen-header">
        <h1>Settings</h1>
      </header>

      <section aria-labelledby="practice-settings-heading">
        <SectionHeading>
          <span id="practice-settings-heading">Practice</span>
        </SectionHeading>
        <Card className="settings-card">
          <FormField
            description="Preview only — changes reset when you leave until profile persistence connects."
            descriptionId="daily-goal-description"
            label="Daily goal"
          >
            <DailyGoalSlider />
          </FormField>
        </Card>
      </section>

      <section aria-labelledby="appearance-settings-heading">
        <SectionHeading>
          <span id="appearance-settings-heading">Appearance</span>
        </SectionHeading>
        <Card className="settings-card">
          <FormField
            description="Auto follows your system setting."
            label="Theme"
          >
            <ThemeControl />
          </FormField>
        </Card>
      </section>

      <section aria-labelledby="account-settings-heading">
        <SectionHeading>
          <span id="account-settings-heading">Account</span>
        </SectionHeading>
        <Card className="settings-card">
          <FormField
            description="Sign in to keep your path and settings together."
            label="Learner profile"
          >
            <AuthControls />
          </FormField>
        </Card>
      </section>

      <section aria-labelledby="data-settings-heading">
        <SectionHeading>
          <span id="data-settings-heading">Data</span>
        </SectionHeading>
        <Card className="settings-card">
          <FormField
            description="Reset becomes available after learner data persistence lands."
            label="Reset learning data"
          >
            <Button disabled variant="danger">
              Reset
            </Button>
          </FormField>
        </Card>
      </section>
    </ScreenContainer>
  );
}
