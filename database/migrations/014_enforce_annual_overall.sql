-- Overall anual sempre e a media arredondada das sete skills da temporada.

UPDATE player_team_years
SET overall = round((
  firepower + entrying + trading + opening +
  clutching + sniping + utility
) / 7.0)::smallint;

CREATE OR REPLACE FUNCTION set_player_team_year_overall()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.overall := round((
    NEW.firepower + NEW.entrying + NEW.trading + NEW.opening +
    NEW.clutching + NEW.sniping + NEW.utility
  ) / 7.0)::smallint;
  RETURN NEW;
END
$$;

CREATE TRIGGER player_team_years_calculate_overall
BEFORE INSERT OR UPDATE OF firepower, entrying, trading, opening, clutching, sniping, utility
ON player_team_years
FOR EACH ROW
EXECUTE FUNCTION set_player_team_year_overall();
